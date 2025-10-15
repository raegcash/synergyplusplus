#!/bin/bash

# Service Template Copy Script
# Usage: ./copy-service-template.sh source-service target-service target-port

if [ "$#" -lt 2 ]; then
    echo "Usage: ./copy-service-template.sh source-service target-service [target-port]"
    echo "Example: ./copy-service-template.sh identity-service investment-service 8083"
    exit 1
fi

SOURCE_SERVICE=$1
TARGET_SERVICE=$2
TARGET_PORT=${3:-8083}

# Convert kebab-case to PascalCase
SOURCE_NAME=$(echo $SOURCE_SERVICE | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++)sub(/./,toupper(substr($i,1,1)),$i)}1' | sed 's/ //g')
TARGET_NAME=$(echo $TARGET_SERVICE | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++)sub(/./,toupper(substr($i,1,1)),$i)}1' | sed 's/ //g')

# Extract base names (remove -service suffix)
SOURCE_BASE=$(echo $SOURCE_SERVICE | sed 's/-service//')
TARGET_BASE=$(echo $TARGET_SERVICE | sed 's/-service//')

echo "🔄 Copying $SOURCE_SERVICE to $TARGET_SERVICE..."
echo "   Source Name: $SOURCE_NAME"
echo "   Target Name: $TARGET_NAME"
echo "   Target Port: $TARGET_PORT"
echo ""

# Check if source exists
if [ ! -d "core-services/$SOURCE_SERVICE" ]; then
    echo "❌ Error: Source service 'core-services/$SOURCE_SERVICE' not found"
    exit 1
fi

# Check if target already exists
if [ -d "core-services/$TARGET_SERVICE" ]; then
    echo "❌ Error: Target service 'core-services/$TARGET_SERVICE' already exists"
    exit 1
fi

# Copy directory
echo "📁 Copying directory structure..."
cp -r core-services/$SOURCE_SERVICE core-services/$TARGET_SERVICE

cd core-services/$TARGET_SERVICE

# Replace package names in Java files
echo "📝 Updating package names..."
find . -type f -name "*.java" -exec sed -i '' "s/package com.superapp.core.$SOURCE_BASE/package com.superapp.core.$TARGET_BASE/g" {} +
find . -type f -name "*.java" -exec sed -i '' "s/import com.superapp.core.$SOURCE_BASE/import com.superapp.core.$TARGET_BASE/g" {} +

# Replace class names
echo "📝 Updating class names..."
find . -type f -name "*.java" -exec sed -i '' "s/${SOURCE_NAME}Service/${TARGET_NAME}Service/g" {} +

# Update pom.xml
echo "📝 Updating pom.xml..."
sed -i '' "s/<artifactId>$SOURCE_SERVICE<\/artifactId>/<artifactId>$TARGET_SERVICE<\/artifactId>/g" pom.xml
sed -i '' "s/<name>$SOURCE_NAME Service<\/name>/<name>$TARGET_NAME Service<\/name>/g" pom.xml
sed -i '' "s/<description>.*<\/description>/<description>$TARGET_NAME Service for Super App Ecosystem<\/description>/g" pom.xml

# Update application.yml
echo "📝 Updating application.yml..."
sed -i '' "s/port: [0-9]*/port: $TARGET_PORT/g" src/main/resources/application.yml
sed -i '' "s/name: $SOURCE_SERVICE/name: $TARGET_SERVICE/g" src/main/resources/application.yml
sed -i '' "s/${SOURCE_BASE}_db/${TARGET_BASE}_db/g" src/main/resources/application.yml
sed -i '' "s/${SOURCE_BASE}://${TARGET_BASE}:/g" src/main/resources/application.yml

# Update application-docker.yml
echo "📝 Updating application-docker.yml..."
sed -i '' "s/${SOURCE_BASE}_db/${TARGET_BASE}_db/g" src/main/resources/application-docker.yml

# Rename package directories
echo "📁 Renaming package directories..."
if [ -d "src/main/java/com/superapp/core/$SOURCE_BASE" ]; then
    mv src/main/java/com/superapp/core/$SOURCE_BASE src/main/java/com/superapp/core/$TARGET_BASE
fi

# Rename main application class file
echo "📁 Renaming main application class..."
if [ -f "src/main/java/com/superapp/core/$TARGET_BASE/${SOURCE_NAME}ServiceApplication.java" ]; then
    mv src/main/java/com/superapp/core/$TARGET_BASE/${SOURCE_NAME}ServiceApplication.java \
       src/main/java/com/superapp/core/$TARGET_BASE/${TARGET_NAME}ServiceApplication.java
fi

# Update README if exists
if [ -f "README.md" ]; then
    echo "📝 Updating README..."
    sed -i '' "s/$SOURCE_NAME Service/$TARGET_NAME Service/g" README.md
    sed -i '' "s/$SOURCE_SERVICE/$TARGET_SERVICE/g" README.md
    sed -i '' "s/Port: [0-9]*/Port: $TARGET_PORT/g" README.md
    sed -i '' "s/localhost:[0-9]*/localhost:$TARGET_PORT/g" README.md
fi

# Update Dockerfile comments
if [ -f "Dockerfile" ]; then
    echo "📝 Updating Dockerfile..."
    sed -i '' "s/$SOURCE_SERVICE/$TARGET_SERVICE/g" Dockerfile
fi

cd ../..

echo ""
echo "✅ Service template copied successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. cd core-services/$TARGET_SERVICE"
echo "   2. Review and modify domain model (entities, enums)"
echo "   3. Update business logic (services, repositories)"
echo "   4. Update API controllers"
echo "   5. Create database migrations"
echo "   6. Build: docker build -t $TARGET_SERVICE:latest ."
echo "   7. Run: docker run -d -p $TARGET_PORT:$TARGET_PORT $TARGET_SERVICE:latest"
echo ""
echo "🎯 Database to create:"
echo "   docker exec postgres psql -U postgres -c \"CREATE DATABASE ${TARGET_BASE}_db;\""
echo ""
echo "📚 Service Guide: See 🔧-SERVICE-GENERATOR-GUIDE.md for details"




