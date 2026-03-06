namespace Models.DTOS
{
    public class SystemStatsDto
    {
        public UserStatsDto Users { get; set; }
        public AccountStatsDto Accounts { get; set; }
        public FinancialStatsDto Financials { get; set; }
    }

    public class UserStatsDto
    {
        public int Total { get; set; }
        public int Admins { get; set; }
        public int RegularUsers { get; set; }
    }

    public class AccountStatsDto
    {
        public int Total { get; set; }
        public int Personal { get; set; }
        public int Joint { get; set; }
    }

    public class FinancialStatsDto
    {
        public int TotalTransactions { get; set; }
        public double TotalSystemBalance { get; set; }
    }
}