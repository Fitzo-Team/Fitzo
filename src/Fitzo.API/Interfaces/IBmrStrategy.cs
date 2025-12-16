using Fitzo.Shared.Dtos;
using Fitzo.API.Entities;
namespace Fitzo.API.Interfaces;

public interface IBmrStrategy
{
    double CalculateBmr(UserProfile profile);
}