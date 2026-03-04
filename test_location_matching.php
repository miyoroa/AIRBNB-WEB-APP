<?php
/**
 * Test Location Matching Logic
 * Run: php test_location_matching.php
 */

require_once 'includes/helpers.php';

echo "Testing Location Matching Logic\n";
echo "================================\n\n";

$testCases = [
    [
        'property' => 'Ngorongoro Crater, Tanzania',
        'search' => 'Ngorongoro Crater, Tanzania',
        'expected' => true,
        'description' => 'Exact match'
    ],
    [
        'property' => 'Ngorongoro Crater, Tanzania',
        'search' => 'ngorongoro crater, tanzania',
        'expected' => true,
        'description' => 'Case insensitive exact match'
    ],
    [
        'property' => 'Ngorongoro Crater, Tanzania',
        'search' => 'Ngorongoro',
        'expected' => true,
        'description' => 'Partial match (name only)'
    ],
    [
        'property' => 'Kruger National Park, South Africa',
        'search' => 'Kruger National Park, South Africa',
        'expected' => true,
        'description' => 'Kruger exact match'
    ],
    [
        'property' => 'Serengeti, Tanzania',
        'search' => 'Ngorongoro Crater, Tanzania',
        'expected' => false,
        'description' => 'Different location (should not match)'
    ],
];

$passed = 0;
$failed = 0;

foreach ($testCases as $i => $test) {
    $result = matchLocation($test['property'], $test['search']);
    $status = $result === $test['expected'] ? '✓ PASS' : '✗ FAIL';
    
    if ($result === $test['expected']) {
        $passed++;
    } else {
        $failed++;
    }
    
    echo sprintf(
        "Test %d: %s\n",
        $i + 1,
        $status
    );
    echo sprintf(
        "  Property: '%s'\n  Search: '%s'\n  Expected: %s, Got: %s\n  Description: %s\n\n",
        $test['property'],
        $test['search'],
        $test['expected'] ? 'true' : 'false',
        $result ? 'true' : 'false',
        $test['description']
    );
}

echo "================================\n";
echo "Results: $passed passed, $failed failed\n";

if ($failed === 0) {
    echo "✓ All tests passed!\n";
    exit(0);
} else {
    echo "✗ Some tests failed!\n";
    exit(1);
}

