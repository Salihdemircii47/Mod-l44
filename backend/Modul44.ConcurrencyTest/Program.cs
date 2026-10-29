
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

const string apiBaseUrl = "http://localhost:5187";

const int customerId = 1;
const int serviceId = 2;

const int firstPrimaryId = 2;
const int sharedOperatorId = 3;
const int secondPrimaryId = 4;

const int repeatCount = 10;

var firstDate = new DateOnly(2026, 11, 26);
var runId = Guid.NewGuid().ToString("N")[..10];

using var client = new HttpClient
{
    BaseAddress = new Uri(apiBaseUrl),
    Timeout = TimeSpan.FromSeconds(60)
};

int passed = 0;
int failed = 0;
int skipped = 0;

Console.WriteLine("MODUL44 - 10 CONCURRENT BOOKING TESTS");
Console.WriteLine("-------------------------------------");
Console.WriteLine($"Run ID: {runId}");
Console.WriteLine($"Repeat count: {repeatCount}");
Console.WriteLine();

try
{
    for (int attempt = 1; attempt <= repeatCount; attempt++)
    {
        var date = firstDate.AddDays((attempt - 1) * 7);

        // 09:00-11:00 Istanbul time.
        // Istanbul is UTC+03:00 for these dates.
        var start = new DateTimeOffset(
            date.Year, date.Month, date.Day,
            6, 0, 0, TimeSpan.Zero);

        var end = start.AddHours(2);

var startUtc = start.UtcDateTime.ToString("yyyy-MM-ddTHH:mm:ss'Z'");
        var endUtc = end.UtcDateTime.ToString("yyyy-MM-ddTHH:mm:ss'Z'");

        var testTag = $"RACE-{runId}-{attempt:00}";

        Console.WriteLine(
            $"TEST {attempt}/{repeatCount} | {date:yyyy-MM-dd}");

        // 1. Check initial availability.
        bool allAvailable = true;

        foreach (var resourceId in new[]
        {
            firstPrimaryId,
            sharedOperatorId,
            secondPrimaryId
        }.Distinct())
        {
            var url =
                $"/api/Availability/resource/{resourceId}" +
                $"?date={date:yyyy-MM-dd}&serviceId={serviceId}";

            using var availabilityResponse =
                await client.GetAsync(url);

            if (!availabilityResponse.IsSuccessStatusCode)
            {
                Console.WriteLine(
                    $"  Resource {resourceId}: HTTP " +
                    $"{(int)availabilityResponse.StatusCode}");

                Console.WriteLine(
                    await availabilityResponse.Content
                        .ReadAsStringAsync());

                allAvailable = false;
                break;
            }

            using var availabilityJson = JsonDocument.Parse(
                await availabilityResponse.Content
                    .ReadAsStringAsync());

            var slots = availabilityJson.RootElement
                .GetProperty("availableSlots");

            bool found = slots
                .EnumerateArray()
                .Any(slot =>
                    slot.GetProperty("startUtc")
                        .GetDateTimeOffset() == start &&
                    slot.GetProperty("endUtc")
                        .GetDateTimeOffset() == end);

            if (!found)
            {
                Console.WriteLine(
                    $"  Resource {resourceId}: NOT AVAILABLE");

                allAvailable = false;
                break;
            }
        }

        if (!allAvailable)
        {
            Console.WriteLine(
                "  SKIPPED: Check working hours or bookings.");

            skipped++;
            Console.WriteLine();
            continue;
        }

        // 2. Prepare two different appointments.
        // Both require the SAME operator.

        var requestA = new
        {
            customerId,
            serviceId,
            startTime = startUtc,
            endTime = endUtc,
            notes = $"{testTag}-A",
            resources = new[]
            {
                new
                {
                    resourceId = firstPrimaryId,
                    role = "Vehicle"
                },
                new
                {
                    resourceId = sharedOperatorId,
                    role = "Operator"
                }
            }
        };

        var requestB = new
        {
            customerId,
            serviceId,
            startTime = startUtc,
            endTime = endUtc,
            notes = $"{testTag}-B",
            resources = new[]
            {
                new
                {
                    resourceId = secondPrimaryId,
                    role = "Assistant"
                },
                new
                {
                    resourceId = sharedOperatorId,
                    role = "Operator"
                }
            }
        };

        // 3. Start both requests simultaneously.
        var gate = new TaskCompletionSource<bool>(
            TaskCreationOptions.RunContinuationsAsynchronously);

        async Task<(string Label, HttpStatusCode Status, string Body)>
            SendAsync(string label, object payload)
        {
            await gate.Task;

            using var response = await client.PostAsJsonAsync(
                "/api/MultiResourceAppointments",
                payload);

            return (
                label,
                response.StatusCode,
                await response.Content.ReadAsStringAsync()
            );
        }

        var taskA = Task.Run(() =>
            SendAsync("A", requestA));

        var taskB = Task.Run(() =>
            SendAsync("B", requestB));

        gate.SetResult(true);

        var results = await Task.WhenAll(taskA, taskB);

        foreach (var result in results)
        {
            Console.WriteLine(
                $"  Request {result.Label}: " +
                $"{(int)result.Status} {result.Status}");

            if (result.Status != HttpStatusCode.Created &&
                result.Status != HttpStatusCode.Conflict)
            {
                Console.WriteLine($"  Response: {result.Body}");
            }
        }

        bool statusesPassed =
            results.Count(x =>
                x.Status == HttpStatusCode.Created) == 1 &&
            results.Count(x =>
                x.Status == HttpStatusCode.Conflict) == 1;

        // 4. Verify persisted appointments.
        using var listResponse = await client.GetAsync(
            "/api/Appointments");

        if (!listResponse.IsSuccessStatusCode)
        {
            Console.WriteLine(
                "  FAILED: Could not fetch appointments.");

            failed++;
            Console.WriteLine();
            continue;
        }

        using var listJson = JsonDocument.Parse(
            await listResponse.Content.ReadAsStringAsync());

        var matches = listJson.RootElement
            .EnumerateArray()
            .Where(item =>
            {
                string? notes = item.TryGetProperty(
                    "notes", out var notesElement)
                    ? notesElement.GetString()
                    : null;

                string? status = item.GetProperty("status")
                    .GetString();

                return notes is not null &&
                    notes.StartsWith(
                        testTag + "-",
                        StringComparison.Ordinal) &&
                    item.GetProperty("startTime")
                        .GetDateTimeOffset() == start &&
                    item.GetProperty("endTime")
                        .GetDateTimeOffset() == end &&
                    !string.Equals(
                        status,
                        "Cancelled",
                        StringComparison.OrdinalIgnoreCase);
            })
            .ToList();

        bool oneBookingSaved = matches.Count == 1;

        // 5. Verify the successful appointment's
        // primary and shared resource assignments.
        bool assignmentsPassed = false;

        if (oneBookingSaved)
        {
            int appointmentId = matches[0]
                .GetProperty("id").GetInt32();

            int primaryId = matches[0]
                .GetProperty("resourceId").GetInt32();

            using var detailResponse = await client.GetAsync(
                $"/api/MultiResourceAppointments/{appointmentId}");

            if (detailResponse.IsSuccessStatusCode)
            {
                using var detailJson = JsonDocument.Parse(
                    await detailResponse.Content
                        .ReadAsStringAsync());

                var actualIds = detailJson.RootElement
                    .GetProperty("resources")
                    .EnumerateArray()
                    .Select(item => item
                        .GetProperty("resourceId")
                        .GetInt32())
                    .ToHashSet();

                bool validPrimary =
                    primaryId == firstPrimaryId ||
                    primaryId == secondPrimaryId;

                assignmentsPassed =
                    validPrimary &&
                    actualIds.SetEquals(new[]
                    {
                        primaryId,
                        sharedOperatorId
                    });

                Console.WriteLine(
                    $"  Appointment ID: {appointmentId}");
                Console.WriteLine(
                    $"  Assigned resource IDs: " +
                    string.Join(", ", actualIds));
            }
        }

        bool testPassed =
            statusesPassed &&
            oneBookingSaved &&
            assignmentsPassed;

        if (testPassed)
        {
            passed++;
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("  PASSED");
        }
        else
        {
            failed++;
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("  FAILED");

            Console.WriteLine(
                $"  Statuses OK: {statusesPassed}");
            Console.WriteLine(
                $"  Persisted bookings: {matches.Count}");
            Console.WriteLine(
                $"  Assignments OK: {assignmentsPassed}");
        }

        Console.ResetColor();
        Console.WriteLine();
    }
}
catch (Exception ex)
{
    failed++;

    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine("TEST EXECUTION ERROR:");
    Console.WriteLine(ex);
    Console.ResetColor();
}

// 6. Print final summary.
Console.WriteLine("=====================================");
Console.WriteLine("FINAL TEST REPORT");
Console.WriteLine("=====================================");
Console.WriteLine($"Total planned: {repeatCount}");
Console.WriteLine($"Passed:        {passed}");
Console.WriteLine($"Failed:        {failed}");
Console.WriteLine($"Skipped:       {skipped}");
Console.WriteLine();

if (passed == repeatCount &&
    failed == 0 &&
    skipped == 0)
{
    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine("ALL 10 TESTS PASSED");
}
else
{
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.WriteLine("TEST SUITE NOT FULLY PASSED");
    Environment.ExitCode = 1;
}

Console.ResetColor();
