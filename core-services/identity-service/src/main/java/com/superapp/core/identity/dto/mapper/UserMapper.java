package com.superapp.core.identity.dto.mapper;

import com.superapp.core.identity.domain.entity.User;
import com.superapp.core.identity.dto.request.RegisterUserRequest;
import com.superapp.core.identity.dto.response.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * MapStruct mapper for User entity
 */
@Mapper(componentModel = "spring", uses = {RoleMapper.class})
public interface UserMapper {

    UserResponse toResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "kycStatus", ignore = true)
    @Mapping(target = "kycCompletedAt", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "failedLoginAttempts", ignore = true)
    @Mapping(target = "accountLockedUntil", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "metadata", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    User toEntity(RegisterUserRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "externalId", ignore = true)
    @Mapping(target = "kycStatus", ignore = true)
    @Mapping(target = "kycCompletedAt", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "failedLoginAttempts", ignore = true)
    @Mapping(target = "accountLockedUntil", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "metadata", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntityFromDto(com.superapp.core.identity.dto.request.UpdateUserRequest dto, @MappingTarget User entity);
}




