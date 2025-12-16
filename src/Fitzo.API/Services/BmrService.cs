using Fitzo.API.Entities;
using Fitzo.API.Interfaces;
using Fitzo.API.Interfaces;
using Fitzo.Shared.Enums;

namespace Fitzo.API.Services;

public class BmrService
{
    private readonly IServiceProvider _serviceProvider;

    public BmrService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public double CalculateBmr(UserProfile profile, BmrFormula formula)
    {
  
        var strategy = _serviceProvider.GetRequiredKeyedService<IBmrStrategy>(formula);
        
        return strategy.CalculateBmr(profile);
    }
}