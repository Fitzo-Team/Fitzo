using Fitzo.API.Entities;

namespace Fitzo.API.Patterns.Validation
{
    public abstract class RecipeValidationHandler
    {
        private RecipeValidationHandler? _nextHandler;

        public RecipeValidationHandler SetNext(RecipeValidationHandler handler)
        {
            _nextHandler = handler;
            return handler;
        }

        public virtual void Handle(Recipe recipe)
        {
            if (_nextHandler != null)
            {
                _nextHandler.Handle(recipe);
            }
        }
    }
}