# Etapa 1: Construcción (Build) - AHORA USAMOS JAVA 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copiamos archivos
COPY server/pom.xml .
COPY server/src ./src

# Compilamos
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución (Run) - AHORA USAMOS JAVA 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiamos el .jar generado
COPY --from=build /app/target/*.jar app.jar

# Exponemos el puerto
EXPOSE 8080

# Ejecutamos
ENTRYPOINT ["java","-jar","app.jar"]