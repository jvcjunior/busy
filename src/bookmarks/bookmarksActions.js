import { createAction } from 'redux-actions';
import {
  getBookmarks as getBookmarksHelper,
  toggleBookmark as toggleBookmarkHelper,
} from '../helpers/localStorageHelpers';

export const GET_BOOKMARKS = '@Bookmarks/GET_BOOKMARKS';
export const GET_BOOKMARKS_START = '@Bookmarks/GET_BOOKMARKS_START';
export const GET_BOOKMARKS_SUCCESS = '@Bookmarks/GET_BOOKMARKS_SUCCESS';
export const GET_BOOKMARKS_FAIL = '@Bookmarks/GET_BOOKMARKS_FAIL';

export const GET_STORED_BOOKMARKS = '@Bookmarks/GET_STORED_BOOKMARKS';

export const TOGGLE_BOOKMARK = '@Bookmarks/TOGGLE_BOOKMARK';
export const TOGGLE_BOOKMARK_SUCCESS = '@Bookmarks/TOGGLE_BOOKMARK_SUCCESS';
export const TOGGLE_BOOKMARK_FAIL = '@Bookmarks/TOGGLE_BOOKMARK_FAIL';

/**
 * Use async await to load all the posts of bookmarked from steemAPI and returns a Promise
 *
 * @param bookmarks from localStorage only contain author and permlink
 * @param steemAPI
 * @returns Promise - bookmarksData
 */
async function getBookmarksData(bookmarks, steemAPI) {
  let bookmarksData = [];
  for (let idx = 0; idx < Object.keys(bookmarks).length; idx++) {
    const postId = Object.keys(bookmarks)[idx];

    const postData = await steemAPI.getContentAsync(
      bookmarks[postId].author,
      bookmarks[postId].permlink
    );
    bookmarksData.push(postData);
  }
  return bookmarksData.sort((a, b) => a.timestamp - b.timestamp).reverse();
}

export const getBookmarks = () => {
  return (dispatch, getState, { steemAPI }) => {
    const { auth } = getState();
    const user = auth.isAuthenticated ? auth.user.name : 'guest';

    const bookmarks = getBookmarksHelper(user);

    dispatch({
      type: GET_BOOKMARKS,
      payload: {
        promise: getBookmarksData(bookmarks, steemAPI).then(
          bookmarksData => ({ postsData: bookmarksData })
        ),
        data: bookmarks,
      }
    });
  };
};


export const toggleBookmarkRequest = createAction(TOGGLE_BOOKMARK);
export const toggleBookmarkSuccess = createAction(TOGGLE_BOOKMARK_SUCCESS);

export const toggleBookmark = (postId) => {
  return (dispatch, getState) => {
    const { posts, auth } = getState();
    const user = auth.isAuthenticated ? auth.user.name : 'guest';

    dispatch(toggleBookmarkRequest(postId));

    const { author, permlink } = posts[postId];

    const bookmarks = toggleBookmarkHelper({ postId, author, permlink }, user);

    dispatch(
      toggleBookmarkSuccess(bookmarks)
    );
  };
};

export const getStoredBookmarks = () => {
  return (dispatch, getState) => {
    const { auth } = getState();
    const user = auth.isAuthenticated ? auth.user.name : 'guest';

    const bookmarks = getBookmarksHelper(user);
    dispatch(
      createAction(GET_STORED_BOOKMARKS)(bookmarks)
    );
  }
};
