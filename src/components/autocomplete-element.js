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

    input.addEventListener("input", () => {
      const val = input.value?.toUpperCase();

      /*close any already open lists of autocompleted values*/
      this.clearOptions();

      if (!val) { 
        return;
      }

      this.choices.filter(
        (word) => {
          const sanitized = word.toUpperCase();

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

    /* cut these strings into pieces, this is my last resort */
    var start = word.toUpperCase().indexOf(matched.toUpperCase());
    if (start !== -1) {
      /*make the matching letters bold:*/
      element.innerHTML += word.substr(0, start);
      element.innerHTML += "<strong>" + word.substr(start, matched.length) + "</strong>";
      element.innerHTML += word.substr(start + matched.length);

      element.addEventListener("click", (e) => {
        e.stopPropagation();

        const input = this.querySelector("input[name=text]");

        input.value = word;
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
}

export const autocompleteTagName = "auto-complete";

window.customElements.define(autocompleteTagName, Autocomplete);