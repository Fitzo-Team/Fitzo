using System.ComponentModel.DataAnnotations;

namespace Fitzo.Shared.Dtos;

public class LoginDto
{
    [Required(ErrorMessage = "Email jest wymagany")]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Hasło jest wymagane")]
    public string Password { get; set; } = string.Empty;
}