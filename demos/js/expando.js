/**
 *
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

class Expando {
  constructor () {
    this._el = document.querySelector('.js-expando');
    this._elInner = this._el.querySelector('.js-expando-inner');
    this._elInnerInverter = this._el.querySelector('.js-expando-inner-inverter');
    this._expandBtn = this._el.querySelector('.js-expando-expand-btn');
    this._collapseBtn = this._el.querySelector('.js-expando-collapse-btn');
    this._content = this._el.querySelector('.js-content');

    this.toggle = this.toggle.bind(this);
    this.expand = this.expand.bind(this);
    this.collapse = this.collapse.bind(this);

    this._calculate();
    this._createEaseAnimations();

    this._expandBtn.addEventListener('click', this.expand);
    this._collapseBtn.addEventListener('click', this.collapse);
  }

  expand () {
    if (this._isExpanded) {
      return;
    }
    this._isExpanded = true;
    this._applyAnimation({expand: true});
  }

  collapse () {
    if (!this._isExpanded) {
      return;
    }
    this._isExpanded = false;
    this._applyAnimation({expand: false});
  }

  toggle () {
    if (this._isExpanded) {
      return this.collapse();
    }

    this.expand();
  }

  _applyAnimation ({expand}=opts) {
    this._elInner.classList.remove('item--expanded');
    this._elInner.classList.remove('item--collapsed');
    this._elInnerInverter.classList.remove('item__contents--expanded');
    this._elInnerInverter.classList.remove('item__contents--collapsed');

    // Force a recalc styles here so the classes take hold.
    window.getComputedStyle(this._elInner).transform;

    if (expand) {
      this._elInner.classList.add('item--expanded');
      this._elInnerInverter.classList.add('item__contents--expanded');
      return;
    }

    this._elInner.classList.add('item--collapsed');
    this._elInnerInverter.classList.add('item__contents--collapsed');
  }

  _calculate () {
    const elBCR = this._el.getBoundingClientRect();
    const collapsed = this._expandBtn.getBoundingClientRect();
    const expanded = this._content.getBoundingClientRect();

    const expandedWidth = Math.abs(expanded.right - elBCR.left);
    const expandedHeight = Math.abs(expanded.bottom - elBCR.top);

    const collapsedWidth = collapsed.width;
    const collapsedHeight = collapsed.height;

    const exRadius = Math.sqrt(expandedWidth * expandedWidth +
        expandedHeight * expandedHeight);
    const colRadius = collapsedWidth * 0.5;

    this._scale = (exRadius - colRadius) / colRadius;

    // Set initial sizes.
    this._el.style.width = `${expandedWidth}px`;
    this._el.style.height = `${expandedHeight}px`;

    this._elInner.style.width = `${collapsedWidth}px`;
    this._elInner.style.height = `${collapsedHeight}px`;

    this._elInner.style.transformOrigin =
        `${collapsedWidth * 0.5}px ${collapsedHeight * 0.5}px`;
    this._elInnerInverter.style.transformOrigin =
        `${collapsedWidth * 0.5}px ${collapsedHeight * 0.5}px`;

  }

  _createEaseAnimations () {
    let ease = document.querySelector('.ease');
    if (ease) {
      return ease;
    }

    ease = document.createElement('style');
    ease.classList.add('ease');

    const expandAnimation = [];
    const expandContentsAnimation = [];
    const expandCircleAnimation = [];
    const collapseAnimation = [];
    const collapseContentsAnimation = [];
    const collapseCircleAnimation = [];
    for (let i = 0; i <= 100; i++) {
      const step = this._ease(i/100);

      // Expand animation.
      this._append({
        i,
        step,
        start: 1,
        end: this._scale,
        outerAnimation: expandAnimation,
        innerAnimation: expandContentsAnimation
      });

      // Collapse animation.
      this._append({
        i,
        step,
        start: this._scale,
        end: 1,
        outerAnimation: collapseAnimation,
        innerAnimation: collapseContentsAnimation
      });
    }

    ease.textContent = `
      @keyframes expandAnimation {
        ${expandAnimation.join('')}
      }
      @keyframes expandContentsAnimation {
        ${expandContentsAnimation.join('')}
      }
      @keyframes collapseAnimation {
        ${collapseAnimation.join('')}
      }
      @keyframes collapseContentsAnimation {
        ${collapseContentsAnimation.join('')}
      }`;

    document.head.appendChild(ease);
    return ease;
  }

  _append ({
        i,
        step,
        start,
        end,
        outerAnimation,
        innerAnimation}=opts) {

    const scale = start + (end - start) * step;
    const invScale = 1 / scale;

    outerAnimation.push(`
      ${i}% {
        transform: scale(${scale});
      }`);

    innerAnimation.push(`
      ${i}% {
        transform: scale(${invScale});
      }`);
  }

  _clamp (value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  _ease (v, pow=4) {
    v = this._clamp(v, 0, 1);

    return 1 - Math.pow(1 - v, pow);
  }
}

new Expando();