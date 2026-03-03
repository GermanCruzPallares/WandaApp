namespace Models
{
    public class Objective
    {
        public int Objective_id { get; set; }
        public int Account_id { get; set; }
        public string Name { get; set; }
        public double Target_amount { get; set; }
        public double Current_save { get; set; }
        public DateTime Deadline { get; set; }

        public bool Is_completed { get; set; }

        public Objective() { }

        public Objective(int account_id, string name, double target_amount, double current_save, DateTime deadline, bool is_completed)
        {
            Account_id = account_id;
            Name = name;
            Target_amount = target_amount;
            Current_save = current_save;
            Deadline = deadline;
            Is_completed= is_completed;
        }
    }
}