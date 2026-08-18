import { trt } from '@trt-web/core';

export const createBayesianRatingPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /*html*/ `<section class="hero"><p class="eyebrow">number-handler/bayesian-rating</p><h1>Bayesian ratings</h1><p>Compare a simple vote-weighted rating with a global-average Bayesian rating.</p></section><section class="card"><label>Item average <input id="rating-average" type="number" min="0" max="5" step="0.1" value="4.8" /></label><label>Item votes <input id="rating-count" type="number" min="0" value="12" /></label><label>Global average <input id="global-average" type="number" min="0" max="5" step="0.1" value="3.6" /></label><label>Minimum votes threshold <input id="rating-threshold" type="number" min="0" value="10" /></label><div class="demo-actions"><button id="simple-rating-run" type="button">Simple rating</button><button id="bayesian-rating-run" type="button">Bayesian rating</button></div><pre id="rating-result" class="demo-result">No rating calculated yet.</pre></section>`;
  const number = (id: string) => Number(page.querySelector<HTMLInputElement>(id)!.value);
  const result = page.querySelector<HTMLElement>('#rating-result')!;
  page.querySelector('#simple-rating-run')?.addEventListener('click', () => {
    result.textContent = String(
      trt.number.calcSimpleBayesianRating({
        ratingAvg: number('#rating-average'),
        ratingCount: number('#rating-count'),
        minimumVotesThreshold: number('#rating-threshold'),
      }),
    );
  });
  page.querySelector('#bayesian-rating-run')?.addEventListener('click', () => {
    result.textContent = String(
      trt.number.calcBayesianRating({
        ratingAvg: number('#rating-average'),
        ratingCount: number('#rating-count'),
        globalAvg: number('#global-average'),
        minimumVotesThreshold: number('#rating-threshold'),
      }),
    );
  });
  return page;
};
