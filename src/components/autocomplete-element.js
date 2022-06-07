import "./autocomplete-element.css";

const template = `
  <input name="text" type="text" autocomplete="off"/>
  <ul class="items">

  </ul>
`;

export class Autocomplete extends HTMLElement {
  constructor () {
    super();

    this.innerHTML = template;

    const input = this.querySelector("input[name=text]");
    input.placeholder = this.getAttribute("placeholder");

    const list = this.querySelector("ul");

    this._choices = [];

    input.addEventListener("input", () => {
      const val = input.value?.toUpperCase();

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
        if (input.getBoundingClientRect().bottom + list.getBoundingClientRect().height >= window.innerHeight) {
          list.style.bottom = '100%';
          list.style.top = 'unset';
        } else {
          list.style.bottom = 'unset';
          list.style.top = '100%';
        }  
      }, 0);
      
      this.value = input.value;
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
      element.innerHTML += text.substr(0, start);
      element.innerHTML += "<strong>" + text.substr(start, matched.length) + "</strong>";
      element.innerHTML += text.substr(start + matched.length);

      element.addEventListener("click", (e) => {
        e.stopPropagation();

        const input = this.querySelector("input[name=text]");

        input.value = element.getAttribute("value");
        this.value = input.value;

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
    const input = this.querySelector("input[name=text]");
    input.value = '';
  }

  set choices(arr) {
    this._choices = [...new Set(arr)];
  }
}

export const autocompleteTagName = "auto-complete";

window.customElements.define(autocompleteTagName, Autocomplete);