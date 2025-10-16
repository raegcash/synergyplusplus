#!/bin/bash

# Reset Admin Password Script
# Resets the admin password to Admin@123

echo "🔄 Resetting admin password..."
echo ""

# Check if Docker container is running
if ! docker ps | grep -q superapp-postgres; then
    echo "❌ Error: PostgreSQL container is not running"
    echo "💡 Start it with:"
    echo "   cd ~/Desktop/Synergy++/superapp-ecosystem"
    echo "   docker-compose -f docker-compose.api-only.yml up -d"
    exit 1
fi

echo "✅ PostgreSQL container is running"
echo ""

# Generate new password hash using bcrypt
echo "🔐 Generating password hash..."

# Use Node.js to generate bcrypt hash
HASH=$(node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin@123', 10).then(hash => console.log(hash));")

echo "✅ Hash generated"
echo ""

# Update password in database
echo "📊 Updating password in database..."

docker exec -i superapp-postgres psql -U marketplace_user -d superapp_marketplace_node <<EOF
UPDATE admin_users 
SET password_hash = '$HASH'
WHERE email = 'admin@superapp.com';

SELECT 'Password reset complete!' AS status;
SELECT email, name, status FROM admin_users WHERE email = 'admin@superapp.com';
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Admin password reset successfully!"
    echo "═══════════════════════════════════════"
    echo "   Email:    admin@superapp.com"
    echo "   Password: Admin@123"
    echo "═══════════════════════════════════════"
    echo "🌐 Login at: http://localhost:3003/"
    echo ""
else
    echo ""
    echo "❌ Error: Failed to reset password"
    exit 1
fi


