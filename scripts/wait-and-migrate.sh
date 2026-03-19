#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}🌿 Chat Knowledge Migration${NC}"
echo -e "${BLUE}=====================================${NC}\n"

# Load env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY not configured${NC}"
  exit 1
fi

SUPABASE_URL=${EXPO_PUBLIC_SUPABASE_URL}

echo -e "${YELLOW}⏳ Waiting for you to login in the app...${NC}"
echo -e "${YELLOW}   (Once logged in, this script will automatically migrate)${NC}\n"

# Wait for user to exist
while true; do
  # Try to get users via curl (requires jq)
  USERS=$(curl -s \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    "${SUPABASE_URL}/auth/v1/admin/users?limit=1" 2>/dev/null | grep -o '"email":"[^"]*"' | head -1)

  if [ ! -z "$USERS" ]; then
    echo -e "${GREEN}✅ User detected in database!${NC}"
    sleep 2
    break
  fi

  echo -n "."
  sleep 2
done

echo -e "\n${GREEN}✅ Running migration...${NC}\n"

# Run the migration
node scripts/migrate-chat-knowledge-admin.js

echo -e "\n${GREEN}✅ Done!${NC}\n"
