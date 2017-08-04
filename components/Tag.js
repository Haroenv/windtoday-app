import { connectMenu } from 'react-instantsearch/connectors';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Badge } from 'rebass';

const CustomBadge = styled(Badge)`
border-radius: 1rem;
padding-right: 8px;
padding-left: 8px;
cursor: pointer;
`;
const Tag = ({ hit, attributeName, ...props }) => {
  const value = hit[attributeName];

  if (value == null) return false;

  return (
    <CustomBadge
      onClick={e => {
        e.preventDefault();
        props.refine(value);
      }}
      m={1}
    >
      {value}
    </CustomBadge>
  );
};

Tag.propTypes = {
  hit: PropTypes.object.isRequired,
  attributeName: PropTypes.string.isRequired,
};

export default connectMenu(Tag);
