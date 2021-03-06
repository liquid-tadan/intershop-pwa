import { at, waitLoadingEnd } from '../../framework';
import { SearchResultPage } from '../../pages/shopping/search-result.page';

const _ = {
  searchTerm: 'microsoft',
  items: 68,
};

describe('Scrolling User', () => {
  before(() => SearchResultPage.navigateTo(_.searchTerm));

  it('should not see all product tiles available in that category', () => {
    at(SearchResultPage, page => {
      page.productList.numberOfItems.should('equal', _.items);
      page.productList.visibleProducts.should('not.have.length', _.items);
    });
  });

  it('should see paging information on page', () => {
    at(SearchResultPage, page => {
      page.productList.currentPage.should('equal', 1);
      cy.scrollTo('bottom');
      waitLoadingEnd();
      page.productList.currentPage.should('equal', 2);
    });
  });

  it('should scroll all the way down and not see paging bar any more', () => {
    at(SearchResultPage, page => {
      page.productList.makeAllProductsVisible();
      page.productList.pagingBar.should('not.be.visible');
    });
  });

  it('should now see all product tiles on page', () => {
    at(SearchResultPage, page => {
      page.productList.visibleProducts.should('have.length', _.items);
    });
  });
});

describe('Google Page Crawler', () => {
  it('should be able to follow different pages', () => {
    SearchResultPage.navigateTo(_.searchTerm);

    at(SearchResultPage, page => {
      page.productList.currentPage.should('equal', 1);

      page.productList.firstVisibleProductSKU.then(firstPageTopSKU => {
        SearchResultPage.navigateTo(_.searchTerm, 4);
        waitLoadingEnd();

        page.productList.currentPage.should('equal', 4);

        page.productList.firstVisibleProductSKU.should('not.equal', firstPageTopSKU);

        SearchResultPage.navigateTo(_.searchTerm, 1);
        waitLoadingEnd();

        page.productList.currentPage.should('equal', 1);

        page.productList.firstVisibleProductSKU.should('equal', firstPageTopSKU);
      });
    });
  });
});
