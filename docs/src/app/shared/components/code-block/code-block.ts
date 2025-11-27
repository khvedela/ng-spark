import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, inject, AfterViewInit, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
import hljs from 'highlight.js';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ClipboardModule],
  templateUrl: './code-block.html',
  styleUrls: ['./code-block.scss'],
})
export class CodeBlockComponent implements OnChanges, AfterViewInit {
  @Input() code = '';
  @Input() language = 'typescript';

  @ViewChild('codeElement') codeElement!: ElementRef<HTMLElement>;

  highlightedCode = '';
  copied = false;

  private sanitizer = inject(DomSanitizer);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code'] || changes['language']) {
      this.highlight();
    }
  }

  ngAfterViewInit(): void {
    this.highlight();
  }

  highlight(): void {
    if (!this.code) return;

    // Ensure language exists, default to plaintext if not
    const validLanguage = hljs.getLanguage(this.language) ? this.language : 'plaintext';
    
    const result = hljs.highlight(this.code, { language: validLanguage });
    this.highlightedCode = result.value;
  }

  onCopy(): void {
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 2000);
  }
}