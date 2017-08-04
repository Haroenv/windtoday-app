/* global APP */

import { Menu, CurrentRefinements, Configure } from 'react-instantsearch/dom';
import { InstantSearch } from './Instantsearch';
import CategoryTabs from './CategoryTabs';
import Headroom from 'react-headroom';
import PropTypes from 'prop-types';
import AppBar from './AppBar';
import Hits from './Hits';
import Hit from './Hit';
import { connectMenu } from 'react-instantsearch/connectors';

const VirtualMenu = connectMenu(() => null);
const VirtualBrands = ({ brand }) =>
  <VirtualMenu attributeName="brands" defaultRefinement={brand} />;

export default class Bingo extends React.Component {
  static propTypes = {
    searchState: PropTypes.object,
    resultsState: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    onSearchStateChange: PropTypes.func,
    createURL: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      refinedBrand: undefined,
    };
    this.onRefine = this.onRefine.bind(this);
  }

  onRefine(brand) {
    if (brand) {
      this.setState(() => ({ refinedBrand: brand }));
    }
  }

  render() {
    const { refinedBrand } = this.state;
    return (
      <InstantSearch
        appId={APP.algolia.appId}
        apiKey={APP.algolia.apiKey}
        indexName={APP.algolia.indexName}
        resultsState={this.props.resultsState}
        onSearchStateChange={this.props.onSearchStateChange}
        searchState={this.props.searchState}
        createURL={this.props.createURL}
      >
        <Configure hitsPerPage={10} />
        <Headroom>
          <AppBar />
          <CategoryTabs attributeName="category" />
        </Headroom>
        <CurrentRefinements />
        <VirtualBrands brand={refinedBrand} />
        <Hits hitComponent={Hit} onRefine={this.onRefine} />
      </InstantSearch>
    );
  }
}
