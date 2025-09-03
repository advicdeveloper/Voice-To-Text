import { IInputs, IOutputs } from "./generated/ManifestTypes";

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare const SpeechRecognition: SpeechRecognitionConstructor;
declare const webkitSpeechRecognition: SpeechRecognitionConstructor;

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

export class VoiceToTextPCF implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _context: ComponentFramework.Context<IInputs>;
    private _notifyOutputChanged: () => void;
    private _container: HTMLDivElement;
    private _textElement: HTMLTextAreaElement;
    private _startButton: HTMLButtonElement;
    private _recognition: SpeechRecognition | null = null;
    private _value: string | undefined;
    private _finalText: string; // Store finalized transcriptions

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: Record<string, unknown>,
        container: HTMLDivElement
    ): void {
        this._context = context;
        this._notifyOutputChanged = notifyOutputChanged;
        this._container = container;
        this._finalText = context.parameters.controlValue.raw || ""; // Initialize with existing value

        // Create textarea
        this._textElement = document.createElement("textarea");
        this._textElement.setAttribute("rows", "5");
        this._textElement.value = this._finalText;
        this._textElement.addEventListener("input", this.onChange.bind(this));
        container.appendChild(this._textElement);

        // Create button
        this._startButton = document.createElement("button");
        this._startButton.innerText = "Start Speaking";
        this._startButton.addEventListener("click", this.toggleRecognition.bind(this));
        container.appendChild(this._startButton);

        // Safe constructor selection
        const SpeechRecognitionConstructor: SpeechRecognitionConstructor | undefined =
            (window as Partial<{ SpeechRecognition: SpeechRecognitionConstructor }>).SpeechRecognition ||
            (window as Partial<{ webkitSpeechRecognition: SpeechRecognitionConstructor }>).webkitSpeechRecognition;

        if (SpeechRecognitionConstructor) {
            this._recognition = new SpeechRecognitionConstructor();
            this._recognition.continuous = true;
            this._recognition.interimResults = true;
            this._recognition.lang = "en-US";

            this._recognition.onstart = () => {
                this._startButton.innerText = "Listening...";
            };

            this._recognition.onresult = (event: SpeechRecognitionEvent) => {
                let interimTranscript = "";
                let finalTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + " ";
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Append final transcript to _finalText
                if (finalTranscript) {
                    this._finalText += finalTranscript;
                }

                // Update textarea with final and interim results
                this._textElement.value = this._finalText + interimTranscript;
                this._value = this._finalText; // Only save final text to bound field
                this._notifyOutputChanged();
            };

            this._recognition.onend = () => {
                this._startButton.innerText = "Start Speaking";
                // Ensure textarea shows only final text when recognition ends
                this._textElement.value = this._finalText;
                this._value = this._finalText;
                this._notifyOutputChanged();
            };

            this._recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error("Speech recognition error:", event.error, event.message);
                this._startButton.innerText = "Start Speaking";
                this._startButton.disabled = event.error === "no-speech" || event.error === "aborted" ? false : true;
                this._textElement.value = this._finalText + `\n[Error: ${event.error}]`;
                this._value = this._finalText; // Keep _value as final text
                this._notifyOutputChanged();
            };
        } else {
            this._startButton.disabled = true;
            this._startButton.innerText = "Browser Not Supported";
        }
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        const newValue = context.parameters.controlValue.raw || "";
        if (this._finalText !== newValue) {
            this._finalText = newValue;
            this._textElement.value = newValue;
            this._value = newValue;
        }
    }

    public getOutputs(): IOutputs {
        return {
            controlValue: this._value || ""
        };
    }

    public destroy(): void {
        if (this._recognition) {
            this._recognition.stop();
            this._recognition.onresult = null;
            this._recognition.onend = null;
            this._recognition.onerror = null;
        }
        this._startButton.removeEventListener("click", this.toggleRecognition.bind(this));
        this._textElement.removeEventListener("input", this.onChange.bind(this));
    }

    private onChange(): void {
        this._finalText = this._textElement.value;
        this._value = this._finalText;
        this._notifyOutputChanged();
    }

    private toggleRecognition(): void {
        if (!this._recognition) return;

        if (this._startButton.innerText === "Start Speaking") {
            this._recognition.start();
            this._startButton.innerText = "Listening...";
        } else {
            this._recognition.stop();
            this._startButton.innerText = "Start Speaking";
        }
    }
}