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
    public class TransactionServiceTests
    {
        private readonly Mock<ITransactionRepository> _transactionRepositoryMock;
        private readonly Mock<IAccountRepository> _accountRepositoryMock;
        private readonly Mock<IObjectiveRepository> _objectiveRepositoryMock;
        private readonly Mock<ITransactionSplitRepository> _splitRepositoryMock;
        private readonly Mock<IAccountUsersRepository> _accountUsersRepositoryMock;
        private readonly TransactionService _transactionService;

        public TransactionServiceTests()
        {
            _transactionRepositoryMock = new Mock<ITransactionRepository>();
            _accountRepositoryMock = new Mock<IAccountRepository>();
            _objectiveRepositoryMock = new Mock<IObjectiveRepository>();
            _splitRepositoryMock = new Mock<ITransactionSplitRepository>();
            _accountUsersRepositoryMock = new Mock<IAccountUsersRepository>();

            _transactionService = new TransactionService(
                _transactionRepositoryMock.Object,
                _accountRepositoryMock.Object,
                _objectiveRepositoryMock.Object,
                _splitRepositoryMock.Object,
                _accountUsersRepositoryMock.Object);
        }

        [Fact]
        public async Task CreateAsync_ShouldThrowException_WhenAccountDoesNotExist()
        {
            // Arrange
            _accountRepositoryMock.Setup(x => x.GetByIdAsync(It.IsAny<int>())).ReturnsAsync((Account?)null);

            // Act
            Func<Task> act = async () => await _transactionService.CreateAsync(1, 1, new TransactionCreateDTO());

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>();
        }

        [Fact]
        public async Task CreateAsync_ShouldUpdateBalance_WhenPersonalIncome()
        {
            // Arrange
            var accountId = 1;
            var userId = 1;
            var initialAmount = 100.0;
            var transactionAmount = 50.0;

            var account = new Account { Account_id = accountId, Amount = initialAmount, Account_type = "personal", Name = "Personal" };
            var dto = new TransactionCreateDTO 
            { 
                Amount = transactionAmount, 
                Transaction_type = "income", 
                Split_type = "individual",
                Concept = "Salary",
                Category = "Work",
                Transaction_date = DateTime.Now
            };

            _accountRepositoryMock.Setup(x => x.GetByIdAsync(accountId)).ReturnsAsync(account);
            _transactionRepositoryMock.Setup(x => x.AddTransactionAsync(It.IsAny<Models.Transaction>())).ReturnsAsync(1);

            // Act
            await _transactionService.CreateAsync(accountId, userId, dto);

            // Assert
            account.Amount.Should().Be(initialAmount + transactionAmount);
            _accountRepositoryMock.Verify(x => x.UpdateAsync(It.Is<Account>(a => a.Amount == 150.0)), Times.Once);
            _transactionRepositoryMock.Verify(x => x.AddTransactionAsync(It.IsAny<Models.Transaction>()), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_ShouldThrowException_WhenInsufficientFundsForExpense()
        {
            // Arrange
            var accountId = 1;
            var userId = 1;
            var account = new Account { Account_id = accountId, Amount = 10.0, Account_type = "personal", Name = "Personal" };
            var dto = new TransactionCreateDTO 
            { 
                Amount = 100.0, 
                Transaction_type = "expense", 
                Split_type = "individual",
                Concept = "Expensive Gift",
                Category = "Gifts",
                Transaction_date = DateTime.Now
            };

            _accountRepositoryMock.Setup(x => x.GetByIdAsync(accountId)).ReturnsAsync(account);

            // Act
            Func<Task> act = async () => await _transactionService.CreateAsync(accountId, userId, dto);

            // Assert
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*Saldo insuficiente*");
        }

        [Fact]
        public async Task CreateAsync_ShouldCreateMirrorTransaction_WhenJointAccount()
        {
            // Arrange
            var jointAccountId = 2;
            var personalAccountId = 1;
            var userId = 10;
            
            var jointAccount = new Account { Account_id = jointAccountId, Account_type = "joint", Name = "Joint Account" };
            var personalAccount = new Account { Account_id = personalAccountId, Account_type = "personal", Name = "Personal Account", Amount = 1000.0 };
            
            var dto = new TransactionCreateDTO 
            { 
                Amount = 100.0, 
                Transaction_type = "expense", 
                Split_type = "contribution",
                Concept = "Dinner",
                Category = "Food",
                Transaction_date = DateTime.Now
            };

            _accountRepositoryMock.Setup(x => x.GetByIdAsync(jointAccountId)).ReturnsAsync(jointAccount);
            _accountRepositoryMock.Setup(x => x.GetPersonalAccountByUserIdAsync(userId)).ReturnsAsync(personalAccount);
            _transactionRepositoryMock.Setup(x => x.AddTransactionAsync(It.IsAny<Models.Transaction>())).ReturnsAsync(1);

            // Act
            await _transactionService.CreateAsync(jointAccountId, userId, dto);

            // Assert
            // Should update personal account balance because it's the funding account for joint contribution
            personalAccount.Amount.Should().Be(900.0);
            _accountRepositoryMock.Verify(x => x.UpdateAsync(personalAccount), Times.Once);
            
            // Should add two transactions: one for joint account, one "mirror" for personal account
            _transactionRepositoryMock.Verify(x => x.AddTransactionAsync(It.Is<Models.Transaction>(t => t.Account_id == jointAccountId)), Times.Once);
            _transactionRepositoryMock.Verify(x => x.AddTransactionAsync(It.Is<Models.Transaction>(t => t.Account_id == personalAccountId)), Times.Once);
        }
    }
}
