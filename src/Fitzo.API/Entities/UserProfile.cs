
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Fitzo.Shared.Enums;

namespace Fitzo.API.Entities;
public class UserProfile
{
    [Key]
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime Createdate {get; set;} = DateTime.Now;
    public double Weight { get; set; } 

    public double Height { get; set; } 

    public int Age { get; set; }
    public string? AvatarUrl { get; set; }
    public Gender Gender { get; set; }

}