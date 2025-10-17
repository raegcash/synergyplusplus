-- Insert default permissions
INSERT INTO permissions (id, name, description, resource, action, is_active, created_at, created_by) VALUES
(gen_random_uuid(), 'users:read', 'Read user information', 'users', 'read', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'users:create', 'Create new users', 'users', 'create', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'users:update', 'Update user information', 'users', 'update', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'users:delete', 'Delete users', 'users', 'delete', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'roles:read', 'Read role information', 'roles', 'read', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'roles:create', 'Create new roles', 'roles', 'create', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'roles:update', 'Update role information', 'roles', 'update', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'roles:delete', 'Delete roles', 'roles', 'delete', TRUE, NOW(), 'system');

-- Insert default roles
INSERT INTO roles (id, name, description, is_active, created_at, created_by) VALUES
(gen_random_uuid(), 'ADMIN', 'System administrator with full access', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'USER', 'Standard user with basic access', TRUE, NOW(), 'system'),
(gen_random_uuid(), 'PARTNER_ADMIN', 'Partner administrator', TRUE, NOW(), 'system');

-- Assign permissions to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN';

-- Assign limited permissions to USER role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'USER' AND p.name IN ('users:read');

-- Assign partner admin permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'PARTNER_ADMIN' AND p.name IN ('users:read', 'users:create', 'users:update');




