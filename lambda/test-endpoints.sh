#!/bin/bash

# Comprehensive API Endpoint Testing Script
# Tests all 37 endpoints and reports results

API_BASE="https://o90rhtv5i4.execute-api.us-east-1.amazonaws.com/prod"

# Test data IDs from seed data
EVENT_ID="6cfa60bb-4bf9-445e-9479-b745d72c0f9c"
TEAM_ID="44642dee-f808-463e-b8d1-4225cd41dbb0"
JUDGE_ID="0fc837c2-a2a6-44bb-829a-ab492416a44a"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL=0
PASSED=0
FAILED=0

# Arrays to store results
declare -a PASSED_ENDPOINTS
declare -a FAILED_ENDPOINTS

# Function to test endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    
    TOTAL=$((TOTAL + 1))
    
    echo -e "${BLUE}Testing [$TOTAL]:${NC} $name"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # Check if response is valid JSON and has no error
    if echo "$body" | jq -e . >/dev/null 2>&1; then
        if echo "$body" | jq -e '.error' >/dev/null 2>&1; then
            echo -e "${RED}✗ FAILED${NC} (HTTP $http_code) - Error: $(echo "$body" | jq -r '.error')"
            FAILED=$((FAILED + 1))
            FAILED_ENDPOINTS+=("$name")
        elif [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
            echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
            PASSED=$((PASSED + 1))
            PASSED_ENDPOINTS+=("$name")
        else
            echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
            FAILED=$((FAILED + 1))
            FAILED_ENDPOINTS+=("$name")
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code) - Invalid JSON response"
        FAILED=$((FAILED + 1))
        FAILED_ENDPOINTS+=("$name")
    fi
    echo ""
}

echo -e "${YELLOW}============================================${NC}"
echo -e "${YELLOW}  Meloy Judge API - Endpoint Testing${NC}"
echo -e "${YELLOW}============================================${NC}"
echo ""

# ==================== ADMIN ENDPOINTS ====================
echo -e "${BLUE}=== ADMIN ENDPOINTS ===${NC}"

test_endpoint "Init Schema" "POST" "$API_BASE/admin/init-schema"
test_endpoint "Seed Data" "POST" "$API_BASE/admin/seed-data"

# ==================== EVENT ENDPOINTS ====================
echo -e "${BLUE}=== EVENT ENDPOINTS ===${NC}"

test_endpoint "List Events" "GET" "$API_BASE/events"
test_endpoint "Get Event Detail" "GET" "$API_BASE/events/$EVENT_ID"
test_endpoint "Get Event Leaderboard" "GET" "$API_BASE/events/$EVENT_ID/leaderboard"
test_endpoint "Get Event Insights" "GET" "$API_BASE/events/$EVENT_ID/insights"
test_endpoint "Get Moderator Status" "GET" "$API_BASE/events/$EVENT_ID/moderator/status"
test_endpoint "Create Event" "POST" "$API_BASE/events" \
    '{"name":"Test Event","eventType":"hackathon","startDate":"2026-04-01T09:00:00Z","endDate":"2026-04-01T18:00:00Z","location":"Test Location","description":"Test event description"}'

# Get the created event ID from the response for update/delete tests
CREATED_EVENT_RESPONSE=$(curl -s -X POST "$API_BASE/events" \
    -H "Content-Type: application/json" \
    -d '{"name":"Event For Testing","eventType":"hackathon","startDate":"2026-05-01T09:00:00Z","endDate":"2026-05-01T18:00:00Z"}')
CREATED_EVENT_ID=$(echo "$CREATED_EVENT_RESPONSE" | jq -r '.event.id // empty')

if [ ! -z "$CREATED_EVENT_ID" ]; then
    test_endpoint "Update Event" "PUT" "$API_BASE/events/$CREATED_EVENT_ID" \
        '{"name":"Updated Test Event","description":"Updated description"}'
    test_endpoint "Update Judging Phase" "PUT" "$API_BASE/events/$CREATED_EVENT_ID/judging-phase" \
        '{"judgingPhase":"in-progress"}'
    test_endpoint "Update Active Team" "PUT" "$API_BASE/events/$CREATED_EVENT_ID/team-active" \
        '{"teamId":"'$TEAM_ID'"}'
    test_endpoint "Delete Event" "DELETE" "$API_BASE/events/$CREATED_EVENT_ID"
else
    echo -e "${YELLOW}Skipping update/delete event tests - no created event${NC}"
fi

# ==================== TEAM ENDPOINTS ====================
echo -e "${BLUE}=== TEAM ENDPOINTS ===${NC}"

test_endpoint "List Teams by Event" "GET" "$API_BASE/events/$EVENT_ID/teams"
test_endpoint "Get Team Detail" "GET" "$API_BASE/teams/$TEAM_ID"
test_endpoint "List Pending Teams" "GET" "$API_BASE/events/$EVENT_ID/teams/pending"
test_endpoint "Create Team" "POST" "$API_BASE/events/$EVENT_ID/teams" \
    '{"name":"Test Team","projectTitle":"Test Project","description":"Test team description"}'

# Get created team ID
CREATED_TEAM_RESPONSE=$(curl -s -X POST "$API_BASE/events/$EVENT_ID/teams" \
    -H "Content-Type: application/json" \
    -d '{"name":"Team For Testing","projectTitle":"Testing Project"}')
CREATED_TEAM_ID=$(echo "$CREATED_TEAM_RESPONSE" | jq -r '.team.id // empty')

if [ ! -z "$CREATED_TEAM_ID" ]; then
    test_endpoint "Update Team" "PUT" "$API_BASE/teams/$CREATED_TEAM_ID" \
        '{"name":"Updated Team Name","projectTitle":"Updated Project"}'
    test_endpoint "Add Team Member" "POST" "$API_BASE/teams/$CREATED_TEAM_ID/members" \
        '{"name":"John Doe","email":"john@example.com"}'
    
    # Get member ID for removal test
    MEMBERS_RESPONSE=$(curl -s "$API_BASE/teams/$CREATED_TEAM_ID")
    MEMBER_ID=$(echo "$MEMBERS_RESPONSE" | jq -r '.team.members[0].id // empty')
    
    if [ ! -z "$MEMBER_ID" ]; then
        test_endpoint "Remove Team Member" "DELETE" "$API_BASE/teams/$CREATED_TEAM_ID/members/$MEMBER_ID"
    fi
    
    test_endpoint "Delete Team" "DELETE" "$API_BASE/teams/$CREATED_TEAM_ID"
else
    echo -e "${YELLOW}Skipping team member tests - no created team${NC}"
fi

# ==================== JUDGE ENDPOINTS ====================
echo -e "${BLUE}=== JUDGE ENDPOINTS ===${NC}"

test_endpoint "List All Judges" "GET" "$API_BASE/judges"
test_endpoint "Get Assigned Judges" "GET" "$API_BASE/events/$EVENT_ID/judges/assigned"
test_endpoint "Get Online Judges" "GET" "$API_BASE/events/$EVENT_ID/judges/online"
test_endpoint "Get My Progress" "GET" "$API_BASE/events/$EVENT_ID/my-progress"
test_endpoint "Judge Heartbeat" "POST" "$API_BASE/judge/heartbeat" \
    '{"eventId":"'$EVENT_ID'"}'
test_endpoint "Assign Judge" "POST" "$API_BASE/events/$EVENT_ID/judges" \
    '{"userId":"'$JUDGE_ID'"}'
test_endpoint "Remove Judge" "DELETE" "$API_BASE/events/$EVENT_ID/judges/$JUDGE_ID"

# ==================== SCORING ENDPOINTS ====================
echo -e "${BLUE}=== SCORING ENDPOINTS ===${NC}"

test_endpoint "Get Rubric" "GET" "$API_BASE/rubric"
test_endpoint "Submit Scores" "POST" "$API_BASE/scores" \
    '{"teamId":"'$TEAM_ID'","eventId":"'$EVENT_ID'","scores":[{"rubricCriteriaId":"1","score":20,"reflection":"Good work"},{"rubricCriteriaId":"2","score":22,"reflection":"Excellent"}],"comments":"Overall great presentation","timeSpentSeconds":900}'

# ==================== USER ENDPOINTS ====================
echo -e "${BLUE}=== USER ENDPOINTS ===${NC}"

test_endpoint "List Users" "GET" "$API_BASE/users"
test_endpoint "Update User Role" "PUT" "$API_BASE/users/$JUDGE_ID/role" \
    '{"role":"moderator"}'

# ==================== SPONSOR ENDPOINTS ====================
echo -e "${BLUE}=== SPONSOR ENDPOINTS ===${NC}"

test_endpoint "Create Sponsor" "POST" "$API_BASE/sponsors" \
    '{"name":"Test Sponsor","tier":"gold","primaryColor":"#FFD700","secondaryColor":"#FFFFFF","textColor":"#000000"}'

# Get created sponsor ID
CREATED_SPONSOR_RESPONSE=$(curl -s -X POST "$API_BASE/sponsors" \
    -H "Content-Type: application/json" \
    -d '{"name":"Sponsor For Testing","tier":"silver"}')
CREATED_SPONSOR_ID=$(echo "$CREATED_SPONSOR_RESPONSE" | jq -r '.sponsor.id // empty')

if [ ! -z "$CREATED_SPONSOR_ID" ]; then
    test_endpoint "Update Sponsor" "PUT" "$API_BASE/sponsors/$CREATED_SPONSOR_ID" \
        '{"name":"Updated Sponsor","tier":"platinum"}'
else
    echo -e "${YELLOW}Skipping update sponsor test - no created sponsor${NC}"
fi

# ==================== ACTIVITY ENDPOINTS ====================
echo -e "${BLUE}=== ACTIVITY ENDPOINTS ===${NC}"

test_endpoint "List Activity" "GET" "$API_BASE/activity"
test_endpoint "List Activity by Event" "GET" "$API_BASE/activity?eventId=$EVENT_ID"

# ==================== SUMMARY ====================
echo ""
echo -e "${YELLOW}============================================${NC}"
echo -e "${YELLOW}  TEST SUMMARY${NC}"
echo -e "${YELLOW}============================================${NC}"
echo ""
echo -e "Total Endpoints Tested: ${BLUE}$TOTAL${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo -e "Success Rate: ${BLUE}$(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")%${NC}"
echo ""

if [ ${#FAILED_ENDPOINTS[@]} -gt 0 ]; then
    echo -e "${RED}Failed Endpoints:${NC}"
    for endpoint in "${FAILED_ENDPOINTS[@]}"; do
        echo -e "  ${RED}✗${NC} $endpoint"
    done
    echo ""
fi

echo -e "${GREEN}Passed Endpoints:${NC}"
for endpoint in "${PASSED_ENDPOINTS[@]}"; do
    echo -e "  ${GREEN}✓${NC} $endpoint"
done
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Backend is fully operational.${NC}"
else
    echo -e "${YELLOW}⚠️  Some endpoints need attention. Review failed tests above.${NC}"
fi
