# RTX 3090 VRAM Temperatures - What I've Learned Running Mine at 120 MH/s

I own an NVIDIA RTX 3090 Founder's Edition that I've been running for mining since early 2021, and I wish someone had told me about the VRAM temperature issue before I started.

The first time I fired up my 3090 FE on NiceHash, the core temps looked fine - hovering around 55°C to 60°C - but the VRAM hit 110°C within minutes. That's the thermal throttling point where the card starts pulling back performance to protect itself.

## The GDDR6X Memory Problem

You might have noticed that RTX 3090 cards are particularly prone to running hot on memory-intensive workloads. For me, this became a problem when trying to hit 120 MH/s on Ethereum mining.

The issue is the GDDR6X modules. Micron specs them for a maximum junction temperature of 95°C to 105°C, and NVIDIA's Founder's Edition cards sit the modules on the back of the PCB with barely any cooling. Stock configuration, my card was hitting 100°C to 110°C under load - not ideal for longevity.

I've seen three RTX 3080 and 3090 cards in my mining rigs, and the Founder's Edition models consistently run 10°C to 15°C hotter on VRAM than aftermarket cards with better backplate cooling.

## What Actually Works (and What Doesn't)

The first thing I tried was cranking up my case fans. Did basically nothing. Maybe dropped temps by 2°C.

Adding an external fan blowing directly on my card's backplate? That helped more - got temps down to about 98°C sustained. Better, but still running at Micron's absolute limit.

What made a big difference was replacing the stock thermal pads. I used Thermalright Odyssey pads in 2mm thickness on the backplate side, and temps dropped to 86°C at the same 120 MH/s hashrate. That's roughly a 15°C improvement from thermal pads alone.

Before getting started be sure to observe static precautions - these cards cost too much to fry with static discharge whilst you're working on them.

## Thermal Pad Replacement - The Details

I won't pretend this is simple. You need to strip down my card completely - removing the cooler shroud, the main heatsink, and carefully levering the PCB away from the thermal interface.

The key with these things is choosing the right pad thickness. Too thin and you get poor contact. Too thick and you create excessive pressure that warps the PCB.

For my 3090 FE, I went with:
- 2mm pads on the backplate VRAM modules
- 1.5mm pads on the front-side memory
- Stock thermal paste replaced with Thermal Grizzly Kryonaut

I've been running this configuration for 18 months now, and my VRAM sits at 84°C to 88°C depending on ambient temperature whilst pulling 290W and hitting 121 MH/s.

## The 3090 vs 3080 Question

I have both a 3090 FE and an ASUS TUF 3080 in different rigs. The 3080 hits about 98 MH/s at 230W - better efficiency than my 3090's 121 MH/s at 290W.

The 3090 costs roughly double what a 3080 does, which makes it harder to justify for mining specifically. The extra 14 GB of VRAM (24 GB total vs 10 GB on the 3080) doesn't help with Ethereum mining at all.

If I was building another rig from scratch, I'd probably pick up more 3080 cards rather than 3090s - better price-to-performance ratio and less of a thermal headache on the memory modules.

## What I'd Do Differently

Really not ideal that I didn't research the VRAM cooling issue before buying my 3090 FE. If I'd known, I would have either gone straight for a water-cooled model or at minimum picked an aftermarket card with better backplate thermal design.

The thermal pad mod works, but it's fiddly and there's always a risk of damaging something whilst you're in there levering components apart. For anyone thinking about doing this - make sure you've got the right thickness pads before you start. I ordered three different thicknesses and tested fitment because getting it wrong means starting over.

One thing I learned the hard way: you can't just slam any 2mm pad in there and expect it to work. Pad quality matters. I tried cheap Amazon pads first and saw maybe a 5°C improvement. The Thermalright pads dropped temps by 15°C from the same starting point.

## Current Setup and Performance

My 3090 FE now runs at:
- Core clock: 1200 MHz
- Memory clock: +1100 MHz
- Power limit: 290W (about 75% of stock)
- Fan speed: 75% (keeps core at 58°C)
- VRAM junction: 86°C average
- Hashrate: 121 MH/s on Ethereum

For me, this works well enough. It's not perfect - I'd rather see VRAM under 80°C - but it's stable and the card's been running 24/7 for over a year without throttling or crashes.

The one thing I'm still watching is long-term degradation. GDDR6X at 86°C is within spec, but these modules weren't really designed for constant high-temperature operation. I'll probably retire this card from mining in another year and move it back to gaming duties.

## The Bottom Line

The RTX 3090 can hit 120+ MH/s for mining, but you need to sort out the VRAM cooling or you'll spend your time watching temps creep towards throttling.

Stock configuration isn't good enough for 24/7 mining loads. You've got three real options:
1. Thermal pad replacement (what I did)
2. Water cooling with a full-coverage block
3. Accept 100°C to 110°C temps and hope for the best

Option three probably isn't wise for longevity, but plenty of people run their cards that way and they keep working.

If you're thinking about using a 3090 for mining specifically, the 3080 makes more financial sense unless you already own the 3090 for gaming and want to put it to work when you're not using it. That's my situation - I own a gaming PC with a 3090, so I'm using it for mining whilst I'm at work or asleep.

Just don't expect it to be plug-and-play for mining. You'll need to manage those VRAM temps or you'll throttle.