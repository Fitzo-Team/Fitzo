using Fitzo.API.Entities;

namespace Fitzo.API.Patterns.Validation
{
    public class ImageValidator : RecipeValidationHandler
    {
        public override void Handle(Recipe recipe)
        {
            if (!string.IsNullOrEmpty(recipe.ImageUrl))
            {
                bool isUri = Uri.TryCreate(recipe.ImageUrl, UriKind.Absolute, out var uriResult)
                             && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);

                if (!isUri)
                {
                    throw new ArgumentException("Podany URL obrazka jest nieprawidłowy.");
                }
            }

            Console.WriteLine("ImageValidator: URL obrazka poprawny (lub brak).");

            base.Handle(recipe);
        }
    }
}