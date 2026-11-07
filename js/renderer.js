// FILE_ENTRY: js/renderer.js
import { FieldRenderer } from './drivers/field/FieldRenderer.js';

export class Renderer extends FieldRenderer {
  constructor(tileSize = 64) {
    super(tileSize);
  }
}