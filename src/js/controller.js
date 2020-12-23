import * as model from './model';
import { MODAL_CLOSE_SEC } from './config';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

if (module.hot) {
    module.hot.accept();
}

const controlRecipe = async function () {
    try {
        const id = window.location.hash.slice(1);

        if (!id) return;
        recipeView.renderSpinner();

        // update results view to mark selected search result
        resultsView.update(model.getSearchResultsPage());

        // updating bookmarks
        bookmarksView.update(model.state.bookmarks);

        // loading recipe
        await model.loadRecipe(id);

        // rendering recipe
        recipeView.render(model.state.recipe);
    } catch (err) {
        recipeView.renderError();
    }
};

const controlSearchResults = async function () {
    try {
        resultsView.renderSpinner();

        const query = searchView.getQuery();

        if (!query) return;

        await model.loadSearchResults(query);

        resultsView.render(model.getSearchResultsPage());

        paginationView.render(model.state.search);
    } catch (err) {
        console.log(err);
    }
};

const controlPagination = function (goToPage) {
    resultsView.render(model.getSearchResultsPage(goToPage));

    paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
    // update recipe servings(in state)
    model.updateServings(newServings);

    //update the recipe view
    recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
    // add / remove bookmark
    if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
    else model.deleteBookmark(model.state.recipe.id);

    //  update recipe view
    recipeView.update(model.state.recipe);

    // render bookmarks
    bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
    bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
    try {
        // show loading spinner
        addRecipeView.renderSpinner();

        // upload the new recipe data
        await model.uploadRecipe(newRecipe);
        console.log(model.state.recipe);

        // render recipe
        recipeView.render(model.state.recipe);

        // success message
        addRecipeView.renderMessage();

        // render bookmark view
        bookmarksView.render(model.state.bookmarks);

        // change id in url
        window.history.pushState(null, '', `#${model.state.recipe.id}`);

        // close form window
        setTimeout(function () {
            addRecipeView.toggleWindow();
        }, MODAL_CLOSE_SEC * 1000);
    } catch (err) {
        console.error(err);
        addRecipeView.renderError(err.message);
    }
};

const init = function () {
    bookmarksView.addHandlerRender(controlBookmarks);
    recipeView.addHandlerRender(controlRecipe);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addHandlerAddBookmark(controlAddBookmark);
    searchView.addHandlerSearch(controlSearchResults);
    paginationView.addHandlerClick(controlPagination);
    addRecipeView.addHanderUpload(controlAddRecipe);
};

init();
