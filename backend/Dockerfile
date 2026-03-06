FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["Wanda_Backend.csproj", "./"]
RUN dotnet restore "Wanda_Backend.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/."
RUN dotnet build "Wanda_Backend.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Wanda_Backend.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Wanda_Backend.dll"]
