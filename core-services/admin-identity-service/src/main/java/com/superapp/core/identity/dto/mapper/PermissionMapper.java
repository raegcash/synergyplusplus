package com.superapp.core.identity.dto.mapper;

import com.superapp.core.identity.domain.entity.Permission;
import com.superapp.core.identity.dto.response.PermissionResponse;
import org.mapstruct.Mapper;

/**
 * MapStruct mapper for Permission entity
 */
@Mapper(componentModel = "spring")
public interface PermissionMapper {

    PermissionResponse toResponse(Permission permission);
}




