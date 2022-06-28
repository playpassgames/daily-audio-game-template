import "./autocomplete-element.css";
import uniqby from "lodash.uniqby";

const template = `
  <input name="text" type="text" autocomplete="off"/>
  <ul class="items">

  </ul>
`;

export class Autocomplete extends HTMLElement {
  constructor () {
    super();

    this.innerHTML = template;

    this.input = this.querySelector("input[name=text]");
    this.input.placeholder = this.getAttribute("placeholder");

    const list = this.querySelector("ul");

    this._choices = [];

    this.input.addEventListener("input", () => {
      const val = this.input.value?.toUpperCase();

      /*close any already open lists of autocompleted values*/
      this.clearOptions();

      if (!val) {
        return;
      }

      this._choices.filter(
        (word) => {
          const sanitized = (word?.key ?? word).toUpperCase();

          /* cut these strings into pieces, this is my last resort */
          var start = sanitized.indexOf(val.toUpperCase());
          return start !== -1;
        }
      ).map(
        (word) => this.createOption(word, val),
      ).forEach(
        (e, idx) => {
          e.setAttribute("tabIndex", idx);
          list.appendChild(e);
        },
      );

      setTimeout(() => {
        if (this.input.getBoundingClientRect().bottom + list.getBoundingClientRect().height >= window.innerHeight) {
          list.style.bottom = '100%';
          list.style.top = 'unset';
        } else {
          list.style.bottom = 'unset';
          list.style.top = '100%';
        }
      }, 0);

      this.value = this.input.value;
      this.input.dispatchEvent(new InputEvent("change"));
    });

    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", () => {
      this.clearOptions();
    });
  }

  createOption(word, matched) {
    const element = document.createElement('li');
    element.classList.add('option');
    element.setAttribute("value", word?.value ?? word);

    const text = word?.key ?? word;

    /* cut these strings into pieces, this is my last resort */
    var start = text.toUpperCase().indexOf(matched.toUpperCase());
    if (start !== -1) {
      /*make the matching letters bold:*/
      element.innerHTML = `
        <p>${text.substr(0, start)}<strong>${text.substr(start, matched.length)}</strong>${text.substr(start + matched.length)}</p>
        <sub>${word?.extra}</sub>
      `;

      element.addEventListener("click", (e) => {
        e.stopPropagation();

        this.input.value = element.getAttribute("value");
        this.value = this.input.value;

        this.input.dispatchEvent(new InputEvent("change"));

        this.clearOptions();
      });

      return element;
    }
  }

  clearOptions() {
    const list = this.querySelector("ul");
    list.replaceChildren([]);
  }

  clear() {
    this.input.value = '';
  }

  set choices(arr) {
    this._choices = uniqby(arr, 'value');
  }

  isValidValue(choice) {
    return this._choices.map(({ value }) => value).includes(choice);
  }
}

export const autocompleteTagName = "auto-complete";

window.customElements.define(autocompleteTagName, Autocomplete);
