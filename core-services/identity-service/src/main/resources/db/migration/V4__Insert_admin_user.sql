-- Insert default admin user
-- Password: Admin@123 (BCrypt hashed)
INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    phone_number,
    tenant_id,
    status,
    kyc_status,
    created_at,
    created_by,
    version
) VALUES (
    gen_random_uuid(),
    'admin@superapp.com',
    '$2a$10$rqBjGHN4vqMG6KcN0j/vruOJxVXBtJGrXHhI0DPHqKDrVQjEh0Z7e', -- BCrypt hash for 'Admin@123'
    'System',
    'Administrator',
    '+1234567890',
    'system',
    'ACTIVE',
    'VERIFIED',
    NOW(),
    'system',
    0
) ON CONFLICT (email) DO NOTHING;

-- Assign ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@superapp.com' AND r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

