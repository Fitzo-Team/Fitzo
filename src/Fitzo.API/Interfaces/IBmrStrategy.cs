using Fitzo.Shared.Dtos;
using Fitzo.API.Entities;
namespace Fitzo.Domain.Interfaces;

public interface IBmrStrategy
{
    double CalculateBmr(UserProfile profile);
}