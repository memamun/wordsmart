# Word Entity Responsibilities

This document defines what the `Word` domain entity can and cannot do. This clarifies the boundaries between the Domain model and other layers (such as UI, Repository, and external packages).

## Word CAN

The `Word` entity has the responsibility to know about its own state and answer questions using only its own properties:

* **Know if it has audio:** It can check if its `audioPath` is present and valid.
* **Know if it has mnemonic:** It can check if its `mnemonic` description is present.
* **Know if it is advanced:** It can check if its `level` matches the advanced category.
* **Know if relationships are loaded:** It can determine if lazy-loaded fields (like synonyms, antonyms, and collocations) have been loaded (i.e., not null) vs if they are still unloaded (i.e., null).

## Word CANNOT

The `Word` entity is a pure domain entity. It cannot interact with external services, frameworks, or databases:

* **Play audio:** It does not know how to interact with audio player packages (like `audioplayers` or `just_audio`). This is the responsibility of the Presentation/Services layer.
* **Save bookmark:** It cannot write state to local storage or call databases. This is the responsibility of the Repository layer.
* **Load synonyms / Query SQLite:** It cannot initiate database queries or call the SQLite driver. All data retrieval is done by the Repository layer.
* **Navigate UI:** It does not know about routing, widgets, or navigator contexts.
* **Call Riverpod / State Management:** It does not know about providers, controllers, or reactive state management.
* **Call API:** It cannot make HTTP/gRPC requests to fetch vocabulary data online.
