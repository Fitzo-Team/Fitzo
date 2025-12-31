using Fitzo.API.Entities;

namespace Fitzo.API.Patterns.Validation
{
    public class IngredientsCountValidator : RecipeValidationHandler
    {
        public override void Handle(Recipe recipe)
        {
            if (recipe.Components == null || !recipe.Components.Any())
            {
                throw new ArgumentException("Przepis musi zawierać przynajmniej jeden składnik.");
            }

            if (recipe.Components.Count > 50)
            {
                 throw new ArgumentException("Przepis ma zbyt wiele składników.");
            }

            Console.WriteLine("IngredientsCountValidator: Liczba składników poprawna.");

            base.Handle(recipe);
        }
    }
}