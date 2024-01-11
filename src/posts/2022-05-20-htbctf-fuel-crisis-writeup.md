---
title:  "HTB CTF - Fuel Crisis writeup"
date:   2022-05-20 08:30:00
tags: ["ctf-writeup"]
author: "Alex Ward"
---

At first glance, this challenge seemed to be a case of "upload a .h5 model
trained on the MNIST number data set".

![](https://i.postimg.cc/FK2dDd7Q/Pasted-image-20220515201750.png)

<!-- more -->

The source provided comes with a model, and uploading this and running
"Dock Ship" causes the application to return the error

```
Phalcon's ID is banned from the station.
```

Looking into the code a bit more it appears there is more going on. On startup,
the application uses the model it ships with to randomly generate some images
that satisfy the model for the following ID/ship pairs:

```python
[
    [13376, "IFG-Wing"],
    [66594, "Nebulon-B"], 
    [10054, "Star Destroyer"],
    [88519, "IFG-Gunship"], 
    [32166, "Phalcon"],
]
```

This forms the queue you need to attack:

![](https://i.postimg.cc/pTz97WF5/Pasted-image-20220515204354.png)

When running "Dock Ship", the application will run `.predict()` on each number
in the ID to retrieve it's own confidence score. Then it will try the model that
was uploaded and check the confidence score on that model. If they match, the
ship is allowed to pass!

However, the last ship, `[32166, "Phalcon"]` is banned from the station:

```python
if validated_id == "32166":
    raise DockingException("'s ID is banned from the station.")
```

Fortunately, if the ship name is `"Phalcon"` the "validation check" is skipped.

```python
for spaceship in b1_4s3d_station.spaceships:
    id, id_confidence = b1_4s3d_station.passFirstGate(spaceship.id_image)
    if spaceship.name == "Phalcon":
        b1_4s3d_station.passSecondGate(id, spaceship.id_image, id_confidence, validation_check=False)
    else:
        b1_4s3d_station.passSecondGate(id, spaceship.id_image, id_confidence)
```

Checking `passSecondGate` we can see that `validation_check == False` skips
the validation check with the first model.

Using this, the attack vector is the prediction of `"2"` in the model we
upload. It is the only number in Phalcon's ID that's not present in the
rest of the ID's. If we can provide a model that predict's an image of
a 2 as something else, we should pass all checks.

The actual solve on this one was gotten by my team mate,
[Mehdi](https://www.linkedin.com/in/mehdi-soleimannejad), who heroicly
trained a broken model!
