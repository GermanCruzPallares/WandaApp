namespace Models;

public class ObjectiveUpdateDto
{
    public string Name { get; set; }
    public double Target_amount { get; set; }
    public double Current_save { get; set; }
    public DateTime Deadline { get; set; }

    public bool Is_completed {get; set;}
    public bool Is_archived { get; set; }

}