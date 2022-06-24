import './css/styles.scss';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';

const DEBOUNCE_DELAY = 300;

const countriesInput = document.querySelector('input#search-box');
const countryList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');

countriesInput.addEventListener(
  'input',
  debounce(e => {
    // sanitization of the input event
    const inputCountry = e.target.value.trim();

    if (inputCountry === '') {
      clearRender();
      return;
    }

    fetchCountries(inputCountry)
      .then(countries => choiceRender(countries))
      .catch(error => console.log(error));
  }, DEBOUNCE_DELAY)
);

function fetchCountries(inputCountry) {
  return fetch(
    `https://restcountries.com/v3.1/name/${inputCountry}?fields=name,capital,population,flags,languages`
  ).then(response => {
    return response.json();
  });
}

function choiceRender(countries) {
  console.log(countries);
  if (
    countries.status === 404 ||
    countries.message === 'Not Found' ||
    countries.message
  ) {
    clearRender();
    Notify.failure('Oops, there is no country with that name');
    return;
  }
  if (countries.length > 10) {
    Notify.info('Too many matches found. Please enter a more specific name.');
    return;
  }
  if (countries.length >= 2 && countries.length <= 10) {
    renderCountriesList(countries);
    return;
  }
  if (countries.length === 1) renderCountrieInfo(countries);
}

// Countries List
function renderCountriesList(countries) {
  const markup = countries
    .map(country => {
      return `<li class="country">
          <img class="country__image" src=${country.flags.png} alt="Flag: ${country.name.common}" />
          <span class="country__name">${country.name.common}</span>
        </li>`;
    })
    .join('');
  clearRender();
  countryList.innerHTML = markup;
}

// Country Info
function renderCountrieInfo(countries) {
  const markup = countries
    .map(country => {
      const languages = Object.values(country.languages).join(', ');
      return `
          <div class="country">
            <img class="country__image" src=${country.flags.png} alt="Flag: ${country.name.common}" />
            <span class="country__name country__name--large">${country.name.common}</span>
          </div>
          <p><b>Capital: </b>${country.capital}</p>   
          <p><b>Population: </b>${country.population}</p>          
          <p><b>Languages: </b>${languages}</p>
        `;
    })
    .join('');
  clearRender();
  countryInfo.innerHTML = markup;
}

// Clear Render
function clearRender() {
  countryList.innerHTML = '';
  countryInfo.innerHTML = '';
}
