using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Enums;

namespace Fitzo.API.Services.Bmr;

public class HarrisBenedictStrategy : IBmrStrategy
{
    public double CalculateBmr(UserProfile profile)
    {
        if (profile.Gender == Gender.Male)
        {
            return 66.5 + (13.75 * profile.Weight) + (5.003 * profile.Height) - (6.755 * profile.Age);
        }
        else
        {
            return 655.1 + (9.563 * profile.Weight) + (1.85 * profile.Height) - (4.676 * profile.Age);
        }
    }
}