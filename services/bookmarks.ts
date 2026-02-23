import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = 'test_bookmarks';

export const bookmarksService = {
  getBookmarks: async (): Promise<string[]> => {
    try {
      const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
      return bookmarksJson ? JSON.parse(bookmarksJson) : [];
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return [];
    }
  },

  addBookmark: async (testId: string): Promise<void> => {
    try {
      const bookmarks = await bookmarksService.getBookmarks();
      if (!bookmarks.includes(testId)) {
        const updatedBookmarks = [...bookmarks, testId];
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  },

  removeBookmark: async (testId: string): Promise<void> => {
    try {
      const bookmarks = await bookmarksService.getBookmarks();
      const updatedBookmarks = bookmarks.filter((id) => id !== testId);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  },

  toggleBookmark: async (testId: string): Promise<boolean> => {
    try {
      const bookmarks = await bookmarksService.getBookmarks();
      const isBookmarked = bookmarks.includes(testId);

      if (isBookmarked) {
        await bookmarksService.removeBookmark(testId);
        return false;
      } else {
        await bookmarksService.addBookmark(testId);
        return true;
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  },

  isBookmarked: async (testId: string): Promise<boolean> => {
    try {
      const bookmarks = await bookmarksService.getBookmarks();
      return bookmarks.includes(testId);
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return false;
    }
  },
};
