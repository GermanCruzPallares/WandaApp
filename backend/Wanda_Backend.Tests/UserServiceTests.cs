using Moq;
using Models;
using wandaAPI.Repositories;
using wandaAPI.Services;
using FluentAssertions;
using Xunit;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace Wanda_Backend.Tests
{
    public class UserServiceTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<IAccountService> _accountServiceMock;
        private readonly Mock<IAccountUsersRepository> _accountUsersRepositoryMock;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _accountServiceMock = new Mock<IAccountService>();
            _accountUsersRepositoryMock = new Mock<IAccountUsersRepository>();
            _userService = new UserService(
                _userRepositoryMock.Object, 
                _accountServiceMock.Object, 
                _accountUsersRepositoryMock.Object);
        }

        [Fact]
        public async Task AddAsync_ShouldThrowException_WhenEmailAlreadyExists()
        {
            // Arrange
            var existingEmail = "existing@test.com";
            var newUser = new UserCreateDTO 
            { 
                Email = existingEmail, 
                Password = "Password123", 
                Name = "New User" 
            };

            var existingUsers = new List<User> 
            { 
                new User { Email = existingEmail } 
            };

            _userRepositoryMock.Setup(x => x.GetAllAsync()).ReturnsAsync(existingUsers);

            // Act
            Func<Task> act = async () => await _userService.AddAsync(newUser);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage($"El User '{existingEmail}' ya existe.");
        }

        [Theory]
        [InlineData("short")] // Menos de 5 caracteres
        [InlineData("longpassword")] // Sin mayúscula
        public async Task AddAsync_ShouldThrowException_WhenPasswordIsInvalid(string invalidPassword)
        {
            // Arrange
            var newUser = new UserCreateDTO 
            { 
                Email = "test@test.com", 
                Password = invalidPassword, 
                Name = "Test User" 
            };

            _userRepositoryMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<User>());

            // Act
            Func<Task> act = async () => await _userService.AddAsync(newUser);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>();
        }

        [Fact]
        public async Task AddAsync_ShouldCreateUserAndAccount_WhenDataIsValid()
        {
            // Arrange
            var newUser = new UserCreateDTO 
            { 
                Email = "new@test.com", 
                Password = "Password123", 
                Name = "New User" 
            };

            _userRepositoryMock.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<User>());
            _userRepositoryMock.Setup(x => x.AddAsync(It.IsAny<User>())).ReturnsAsync(1);
            _accountServiceMock.Setup(x => x.AddPersonalAccountAsync(It.IsAny<string>())).ReturnsAsync(100);

            // Act
            await _userService.AddAsync(newUser);

            // Assert
            _userRepositoryMock.Verify(x => x.AddAsync(It.Is<User>(u => u.Email == newUser.Email)), Times.Once);
            _accountServiceMock.Verify(x => x.AddPersonalAccountAsync(newUser.Name), Times.Once);
            _accountUsersRepositoryMock.Verify(x => x.AddAsync(It.Is<AccountUsers>(au => au.User_id == 1 && au.Account_id == 100)), Times.Once);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldThrowKeyNotFoundException_WhenUserDoesNotExist()
        {
            // Arrange
            _userRepositoryMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync((User?)null);

            // Act
            Func<Task> act = async () => await _userService.GetByIdAsync(1);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>();
        }
    }
}
