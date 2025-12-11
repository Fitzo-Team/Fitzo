using Fitzo.API.Entities;
using Fitzo.Shared.Dtos;

namespace Fitzo.API.Interfaces;

public interface IRecipeBuilder
{
    void SetName(string name);
    Recipe Build();
}