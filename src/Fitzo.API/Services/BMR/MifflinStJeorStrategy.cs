using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.Domain.Interfaces;
using Fitzo.Shared.Enums;

namespace Fitzo.API.Services.Bmr;

public class MifflinStJeorStrategy : IBmrStrategy
{
    public double CalculateBmr(UserProfile profile)
    {
       
        double baseResult = (10 * profile.Weight) + (6.25 * profile.Height) - (5 * profile.Age);
        
        return profile.Gender == Gender.Male 
            ? baseResult + 5 
            : baseResult - 161;
    }
}