using System.ComponentModel.DataAnnotations;

namespace Fitzo.Shared.Dtos;

public class RegisterDto
{
    [Required(ErrorMessage = "Email jest wymagany")]
    [EmailAddress(ErrorMessage = "Niepoprawny format adresu email")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Hasło jest wymagane")]
    [MinLength(6, ErrorMessage = "Hasło musi mieć co najmniej 6 znaków")]
    public string Password { get; set; } = string.Empty;

    [Compare("Password", ErrorMessage = "Hasła nie są identyczne")]
    public string ConfirmPassword { get; set; } = string.Empty;
}