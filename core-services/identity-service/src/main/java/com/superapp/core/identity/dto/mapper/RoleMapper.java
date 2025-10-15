package com.superapp.core.identity.dto.mapper;

import com.superapp.core.identity.domain.entity.Role;
import com.superapp.core.identity.dto.response.RoleResponse;
import org.mapstruct.Mapper;

/**
 * MapStruct mapper for Role entity
 */
@Mapper(componentModel = "spring", uses = {PermissionMapper.class})
public interface RoleMapper {

    RoleResponse toResponse(Role role);
}




