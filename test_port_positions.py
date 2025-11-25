#!/usr/bin/env python3
"""
Test script pro zjištění jak se porty vykreslují
"""

def calculate_port_positions(total_ports):
    """Simuluje výpočet pozic portů podle aktuální logiky"""
    
    leftPorts = (total_ports + 1) // 2  # Math.ceil(totalPorts / 2)
    rightPorts = total_ports - leftPorts
    
    positions = []
    
    for index in range(total_ports):
        if index < leftPorts:
            # Levá strana
            portPosition = 'left'
            portOffset = ((index + 1) / (leftPorts + 1)) * 100
        else:
            # Pravá strana
            portPosition = 'right'
            rightIndex = index - leftPorts
            portOffset = ((rightIndex + 1) / (rightPorts + 1)) * 100
        
        positions.append({
            'index': index,
            'port_num': index + 1,
            'position': portPosition,
            'offset': round(portOffset, 2)
        })
    
    return positions

# Testuj různé počty portů
for num_ports in [1, 2, 3, 4, 6, 8]:
    print(f"\n{'='*60}")
    print(f"Testing with {num_ports} ports:")
    print(f"{'='*60}")
    
    positions = calculate_port_positions(num_ports)
    
    for pos in positions:
        print(f"Port {pos['port_num']} (index {pos['index']}): "
              f"{pos['position']:>5} side at {pos['offset']:>6.2f}%")
    
    # Zkontroluj překrývání
    print("\nChecking for overlaps:")
    left_offsets = [p['offset'] for p in positions if p['position'] == 'left']
    right_offsets = [p['offset'] for p in positions if p['position'] == 'right']
    
    left_unique = len(left_offsets) == len(set(left_offsets))
    right_unique = len(right_offsets) == len(set(right_offsets))
    
    print(f"  Left side: {len(left_offsets)} ports, unique positions: {left_unique}")
    print(f"  Right side: {len(right_offsets)} ports, unique positions: {right_unique}")
    
    if not left_unique:
        print(f"  ⚠️ LEFT OVERLAP DETECTED: {left_offsets}")
    if not right_unique:
        print(f"  ⚠️ RIGHT OVERLAP DETECTED: {right_offsets}")
    
    if left_unique and right_unique:
        print(f"  ✅ No overlaps detected!")
