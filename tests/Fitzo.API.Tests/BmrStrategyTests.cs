using Fitzo.API.Entities;
using Fitzo.API.Services.Bmr;
using Fitzo.Shared.Enums;
using FluentAssertions;
using Xunit;

namespace Fitzo.Tests.Services;

public class BmrStrategyTests
{


    [Fact]
    public void MifflinStJeor_ShouldCalculateCorrectly_ForMale()
    {

        var strategy = new MifflinStJeorStrategy();
        var profile = new UserProfile
        {
            Weight = 80,
            Height = 180, 
            Age = 30,
            Gender = Gender.Male
        };

        double expectedBmr = 1780;

        var result = strategy.CalculateBmr(profile);

        result.Should().BeApproximately(expectedBmr, 0.1);
    }

    [Fact]
    public void MifflinStJeor_ShouldCalculateCorrectly_ForFemale()
    {

        var strategy = new MifflinStJeorStrategy();
        var profile = new UserProfile
        {
            Weight = 60,
            Height = 165,
            Age = 25,
            Gender = Gender.Female
        };

        double expectedBmr = 1345.25;

        var result = strategy.CalculateBmr(profile);

        result.Should().BeApproximately(expectedBmr, 0.1);
    }

    [Fact]
    public void HarrisBenedict_ShouldCalculateCorrectly_ForMale()
    {
        var strategy = new HarrisBenedictStrategy();
        var profile = new UserProfile
        {
            Weight = 90,
            Height = 190,
            Age = 40,
            Gender = Gender.Male
        };

        double expectedBmr = 1984.37;

        var result = strategy.CalculateBmr(profile);

        result.Should().BeApproximately(expectedBmr, 0.01);
    }

    [Fact]
    public void HarrisBenedict_ShouldCalculateCorrectly_ForFemale()
    {

        var strategy = new HarrisBenedictStrategy();
        var profile = new UserProfile
        {
            Weight = 55,
            Height = 160,
            Age = 22,
            Gender = Gender.Female
        };

        double expectedBmr = 1374.193;

        var result = strategy.CalculateBmr(profile);

        result.Should().BeApproximately(expectedBmr, 0.01);
    }
}