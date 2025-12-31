using Fitzo.API.Entities;

namespace Fitzo.API.Patterns.Validation
{
    public class DataIntegrityValidator : RecipeValidationHandler
    {
        public override void Handle(Recipe recipe)
        {
            if (string.IsNullOrWhiteSpace(recipe.Name))
            {
                throw new ArgumentException("Nazwa przepisu nie może być pusta.");
            }

            if (recipe.OwnerId == Guid.Empty)
            {
                throw new ArgumentException("Przepis musi mieć przypisanego właściciela.");
            }

            Console.WriteLine("DataIntegrityValidator: Dane podstawowe poprawne.");

            base.Handle(recipe);
        }
    }
}