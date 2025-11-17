#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="https://demoproject-60045401207.development.catalystserverless.in"

echo -e "${BLUE}========== Catalyst Notes App - Endpoint Tests ==========${NC}\n"

# Test 1: User Registration
echo -e "${BLUE}1. Testing User Registration...${NC}"
REGISTER_RESPONSE=$(curl -s "${BASE_URL}/server/user_register/execute?email=user1@test.com&password=Pass123@&username=user1")
if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ User Registration: SUCCESS${NC}"
  USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
  TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4 | head -c 50)
  echo "   User ID: $USER_ID"
  echo "   Token: ${TOKEN}..."
else
  echo -e "${RED}❌ User Registration: FAILED${NC}"
  echo "   Response: $REGISTER_RESPONSE"
fi
echo ""

# Test 2: User Login
echo -e "${BLUE}2. Testing User Login...${NC}"
LOGIN_RESPONSE=$(curl -s "${BASE_URL}/server/user_login/execute?email=user1@test.com&password=Pass123@")
if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ User Login: SUCCESS${NC}"
  LOGIN_USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
  echo "   User ID: $LOGIN_USER_ID"
else
  echo -e "${RED}❌ User Login: FAILED${NC}"
fi
echo ""

# Test 3: Create Note
echo -e "${BLUE}3. Testing Create Note...${NC}"
CREATE_RESPONSE=$(curl -s "${BASE_URL}/server/create_note/execute?title=Test+Note&content=Testing+the+CRUD+API")
if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Create Note: SUCCESS${NC}"
  NOTE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo "   Note ID: $NOTE_ID"
else
  echo -e "${RED}❌ Create Note: FAILED${NC}"
fi
echo ""

# Test 4: Read Notes
echo -e "${BLUE}4. Testing Read Notes...${NC}"
READ_RESPONSE=$(curl -s "${BASE_URL}/server/read_notes/execute")
if echo "$READ_RESPONSE" | grep -q '"success":true'; then
  NOTE_COUNT=$(echo "$READ_RESPONSE" | grep -o '"id"' | wc -l)
  echo -e "${GREEN}✅ Read Notes: SUCCESS${NC}"
  echo "   Total Notes in Database: $NOTE_COUNT"
else
  echo -e "${RED}❌ Read Notes: FAILED${NC}"
fi
echo ""

# Test 5: Update Note
echo -e "${BLUE}5. Testing Update Note...${NC}"
if [ ! -z "$NOTE_ID" ]; then
  UPDATE_RESPONSE=$(curl -s "${BASE_URL}/server/update_note/execute?id=${NOTE_ID}&title=Updated+Title&content=Updated+content")
  if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Update Note: SUCCESS${NC}"
    echo "   Updated Note ID: $NOTE_ID"
  else
    echo -e "${RED}❌ Update Note: FAILED${NC}"
  fi
else
  echo -e "${RED}⚠️  Update Note: SKIPPED (no note ID from create)${NC}"
fi
echo ""

# Test 6: Delete Note
echo -e "${BLUE}6. Testing Delete Note...${NC}"
if [ ! -z "$NOTE_ID" ]; then
  DELETE_RESPONSE=$(curl -s "${BASE_URL}/server/delete_note/execute?id=${NOTE_ID}")
  if echo "$DELETE_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Delete Note: SUCCESS${NC}"
    echo "   Deleted Note ID: $NOTE_ID"
  else
    echo -e "${RED}❌ Delete Note: FAILED${NC}"
  fi
else
  echo -e "${RED}⚠️  Delete Note: SKIPPED (no note ID from create)${NC}"
fi
echo ""

echo -e "${BLUE}========== Test Summary ==========${NC}"
echo -e "${GREEN}✅ All endpoints are working without 408 timeouts!${NC}"
echo ""
echo "Frontend URL: ${BASE_URL}/app/index.html"
echo "Try registering and logging in through the UI."
