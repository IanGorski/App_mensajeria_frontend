import React, { useState } from 'react';
import styles from './SearchBar.module.css';
import ClearIcon from '@mui/icons-material/Clear';

const SearchBar = ({ onSearch, placeholder = "Search..." }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder={placeholder}
        className={styles.searchInput}
      />
      {searchTerm && (
        <button
          type="button"
          onClick={clearSearch}
          className={styles.clearButton}
        >
          <ClearIcon sx={{ fontSize: 18, color: '#54656f' }} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
